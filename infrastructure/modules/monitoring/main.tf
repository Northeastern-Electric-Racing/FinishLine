# Monitoring Module - CloudWatch Dashboards and Alarms

#############
# CloudWatch Dashboard
#############
locals {
  dashboard_alarm_arns = concat(
    [
      aws_cloudwatch_metric_alarm.alb_http_5xx_errors.arn,
      aws_cloudwatch_metric_alarm.eb_cpu_high.arn,
      aws_cloudwatch_metric_alarm.eb_memory_high.arn,
      aws_cloudwatch_metric_alarm.eb_disk_high.arn,
      aws_cloudwatch_metric_alarm.rds_read_latency_high.arn,
    ],
    var.extra_alarm_arns,
  )

  # The CloudWatch agent always appends InstanceId, and instance IDs change on every
  # deploy, so EC2 agent metrics are aggregated across instances with SEARCH instead
  # of referencing a fixed set of dimensions.
  cwagent_memory_search = "SEARCH('{CWAgent,AutoScalingGroupName,InstanceId} MetricName=\"MemoryUtilization\" AutoScalingGroupName=\"${var.eb_autoscaling_group_name}\"', 'Maximum', 300)"

  app_health_widget = var.alb_target_group_arn_suffix == "" ? [] : [
    {
      type   = "metric"
      x      = 0
      y      = 4
      width  = 6
      height = 6
      properties = {
        metrics = [
          ["AWS/ApplicationELB", "HealthyHostCount", "TargetGroup", var.alb_target_group_arn_suffix, "LoadBalancer", var.alb_arn_suffix, { stat = "Minimum", label = "Healthy" }],
          [".", "UnHealthyHostCount", ".", ".", ".", ".", { stat = "Maximum", label = "Unhealthy" }]
        ]
        period = 60
        region = var.aws_region
        title  = "App Health (ALB targets)"
        yAxis = {
          left = {
            min = 0
          }
        }
      }
    }
  ]
}

resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-${var.environment}-dashboard"

  dashboard_body = jsonencode({
    widgets = concat(
      [
        # Alarm Status
        {
          type   = "alarm"
          x      = 0
          y      = 0
          width  = 18
          height = 4
          properties = {
            title  = "Alarm Status"
            alarms = local.dashboard_alarm_arns
          }
        },
        # Links to per-service dashboards
        {
          type   = "text"
          x      = 18
          y      = 0
          width  = 6
          height = 4
          properties = {
            markdown = join("\n", [
              "**Per Service Dashboards**",
              "",
              "[Elastic Beanstalk](https://${var.aws_region}.console.aws.amazon.com/elasticbeanstalk/home?region=${var.aws_region}#/environments) · [Load Balancers](https://${var.aws_region}.console.aws.amazon.com/ec2/home?region=${var.aws_region}#LoadBalancers:)",
              "",
              "[RDS + Performance Insights](https://${var.aws_region}.console.aws.amazon.com/rds/home?region=${var.aws_region}#database:id=${var.rds_instance_id})",
              "",
              "[Logs Insights](https://${var.aws_region}.console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#logsV2:logs-insights)",
            ])
          }
        },
        # Requests (+4xx)
        {
          type   = "metric"
          x      = 6
          y      = 4
          width  = 6
          height = 6
          properties = {
            metrics = [
              ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", var.alb_arn_suffix, { stat = "Sum", label = "Requests" }],
              [".", "HTTPCode_Target_4XX_Count", ".", ".", { stat = "Sum", label = "4xx (right axis)", yAxis = "right" }]
            ]
            period = 60
            region = var.aws_region
            title  = "Requests / min"
            yAxis = {
              left = {
                min = 0
              }
              right = {
                min = 0
              }
            }
          }
        },
        # 5xx Errors
        # Target 5xx = the app returned an error. ELB 5xx = the ALB couldn't get a
        # response from the app at all (container down/restarting/timing out).
        {
          type   = "metric"
          x      = 12
          y      = 4
          width  = 6
          height = 6
          properties = {
            metrics = [
              ["AWS/ApplicationELB", "HTTPCode_Target_5XX_Count", "LoadBalancer", var.alb_arn_suffix, { stat = "Sum", id = "t5", visible = false }],
              [".", "HTTPCode_ELB_5XX_Count", ".", ".", { stat = "Sum", id = "e5", visible = false }],
              [".", "RequestCount", ".", ".", { stat = "Sum", id = "req", visible = false }],
              [{ expression = "FILL(t5, 0)", id = "t5f", label = "5xx from app" }],
              [{ expression = "FILL(e5, 0)", id = "e5f", label = "5xx from ALB (app unreachable)" }],
              [{ expression = "100 * (FILL(t5, 0) + FILL(e5, 0)) / req", id = "rate", label = "5xx rate % (right axis)", yAxis = "right" }]
            ]
            period = 60
            region = var.aws_region
            title  = "5xx Errors"
            yAxis = {
              left = {
                min = 0
              }
              right = {
                min = 0
              }
            }
          }
        },
        # Request Latency (ALB TargetResponseTime)
        # Plotted in the metric's native unit (seconds). Don't scale it with a math
        # expression: CloudWatch keeps the "Seconds" unit on the result, so "* 1000"
        # renders milliseconds as if they were seconds.
        {
          type   = "metric"
          x      = 18
          y      = 4
          width  = 6
          height = 6
          properties = {
            metrics = [
              ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", var.alb_arn_suffix, { stat = "p50", label = "p50" }],
              ["...", { stat = "p95", label = "p95" }],
              ["...", { stat = "Maximum", label = "max (right axis)", yAxis = "right" }]
            ]
            period = 60
            region = var.aws_region
            title  = "Request Latency (s)"
            yAxis = {
              left = {
                min = 0
              }
              right = {
                min = 0
              }
            }
          }
        },
        # EC2 CPU Utilization
        {
          type   = "metric"
          x      = 0
          y      = 10
          width  = 12
          height = 6
          properties = {
            metrics = [
              ["AWS/EC2", "CPUUtilization", "AutoScalingGroupName", var.eb_autoscaling_group_name, { stat = "Maximum", label = "CPU (max across instances)" }]
            ]
            period = 300
            region = var.aws_region
            title  = "EC2 CPU Utilization (%)"
            yAxis = {
              left = {
                min = 0
                max = 100
              }
            }
          }
        },
        # EC2 Memory Utilization (CloudWatch agent)
        {
          type   = "metric"
          x      = 12
          y      = 10
          width  = 12
          height = 6
          properties = {
            metrics = [
              [{ expression = local.cwagent_memory_search, id = "mem", visible = false }],
              [{ expression = "MAX(mem)", id = "memmax", label = "Memory (max across instances)" }]
            ]
            period = 300
            region = var.aws_region
            title  = "EC2 Memory Utilization (%)"
            yAxis = {
              left = {
                min = 0
                max = 100
              }
            }
          }
        },
        # RDS CPU Utilization
        {
          type   = "metric"
          x      = 0
          y      = 16
          width  = 8
          height = 6
          properties = {
            metrics = [
              ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", var.rds_instance_id, { stat = "Average" }]
            ]
            period = 300
            region = var.aws_region
            title  = "RDS CPU Utilization (%)"
            yAxis = {
              left = {
                min = 0
                max = 100
              }
            }
          }
        },
        # RDS Database Connections
        {
          type   = "metric"
          x      = 8
          y      = 16
          width  = 8
          height = 6
          properties = {
            metrics = [
              ["AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier", var.rds_instance_id, { stat = "Maximum" }]
            ]
            period = 300
            region = var.aws_region
            title  = "RDS Database Connections"
            yAxis = {
              left = {
                min = 0
              }
            }
          }
        },
        # RDS DB Load (Performance Insights): average active sessions, split into
        # on-CPU vs waiting (I/O, locks, etc.). Sustained load above the vCPU line
        # means queries are queueing.
        {
          type   = "metric"
          x      = 16
          y      = 16
          width  = 8
          height = 6
          properties = {
            metrics = [
              ["AWS/RDS", "DBLoadCPU", "DBInstanceIdentifier", var.rds_instance_id, { stat = "Average", label = "On CPU" }],
              [".", "DBLoadNonCPU", ".", ".", { stat = "Average", label = "Waiting (I/O, locks, etc.)" }]
            ]
            stacked = true
            period  = 300
            region  = var.aws_region
            title   = "RDS DB Load (active sessions)"
            annotations = {
              horizontal = [
                {
                  value = var.rds_vcpu_count
                  label = "vCPUs"
                }
              ]
            }
            yAxis = {
              left = {
                min = 0
              }
            }
          }
        }
      ],
      local.app_health_widget,
    )
  })
}

#############
# EB CloudWatch Alarms
#############

# High CPU Alarm
resource "aws_cloudwatch_metric_alarm" "eb_cpu_high" {
  alarm_name          = "${var.project_name}-${var.environment}-eb-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "This metric monitors EC2 CPU utilization"
  alarm_actions       = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  dimensions = {
    AutoScalingGroupName = var.eb_autoscaling_group_name
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# HTTP 5xx Error Rate Alarm
# This monitors server errors which indicate application health issues
resource "aws_cloudwatch_metric_alarm" "alb_http_5xx_errors" {
  alarm_name          = "${var.project_name}-${var.environment}-alb-http-5xx-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Sum"
  threshold           = 10 # Alert if more than 10 5xx errors in 5 minutes
  alarm_description   = "High rate of HTTP 5xx errors indicates application issues"
  alarm_actions       = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []
  # The ALB publishes no 5xx datapoints when there are zero errors
  treat_missing_data = "notBreaching"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

#############
# RDS CloudWatch Alarms
#############


# High RDS Read Latency Alarm
resource "aws_cloudwatch_metric_alarm" "rds_read_latency_high" {
  alarm_name          = "${var.project_name}-${var.environment}-rds-read-latency-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "ReadLatency"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 0.01 # 10ms in seconds
  alarm_description   = "RDS read latency is high - may indicate I/O bottleneck or need for indexing"
  alarm_actions       = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  dimensions = {
    DBInstanceIdentifier = var.rds_instance_id
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# High Memory Alarm
# The CloudWatch agent always appends InstanceId (which changes on every deploy),
# so a fixed-dimension alarm on AutoScalingGroupName alone never receives data.
# A Metrics Insights query aggregates across whatever instances are current.
resource "aws_cloudwatch_metric_alarm" "eb_memory_high" {
  alarm_name          = "${var.project_name}-${var.environment}-eb-memory-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  threshold           = 75
  alarm_description   = "This metric monitors EC2 memory utilization"
  alarm_actions       = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  metric_query {
    id          = "q1"
    return_data = true
    expression  = "SELECT MAX(MemoryUtilization) FROM CWAgent WHERE AutoScalingGroupName = '${var.eb_autoscaling_group_name}'"
    period      = 300
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# High Root Disk Alarm
# Old Docker images accumulate on EB instances; alarm before the root volume fills.
resource "aws_cloudwatch_metric_alarm" "eb_disk_high" {
  alarm_name          = "${var.project_name}-${var.environment}-eb-disk-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  threshold           = 80
  alarm_description   = "EC2 root disk utilization is high - old Docker images may need pruning"
  alarm_actions       = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  metric_query {
    id          = "q1"
    return_data = true
    expression  = "SELECT MAX(DiskUtilization) FROM CWAgent WHERE path = '/' AND AutoScalingGroupName = '${var.eb_autoscaling_group_name}'"
    period      = 300
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

#############
# Log Groups
#############
resource "aws_cloudwatch_log_group" "eb_logs" {
  name              = "/aws/elasticbeanstalk/${var.project_name}-${var.environment}"
  retention_in_days = var.log_retention_days

  tags = {
    Name        = "${var.project_name}-${var.environment}-eb-logs"
    Environment = var.environment
    Project     = var.project_name
  }
}
