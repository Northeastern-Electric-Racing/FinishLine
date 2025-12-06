# Monitoring Module - CloudWatch Dashboards and Alarms

#############
# CloudWatch Dashboard
#############
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-${var.environment}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      # EC2 CPU Utilization
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/EC2", "CPUUtilization", "AutoScalingGroupName", var.eb_autoscaling_group_name, { stat = "Average" }]
          ]
          period = 300
          stat   = "Average"
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
      # EC2 Memory Utilization (Custom Metric)
      {
        type = "metric"
        properties = {
          metrics = [
            ["CWAgent", "MemoryUtilization", "AutoScalingGroupName", var.eb_autoscaling_group_name, { stat = "Average" }]
          ]
          period = 300
          stat   = "Average"
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
      # EC2 Disk Utilization (Custom Metric)
      {
        type = "metric"
        properties = {
          metrics = [
            ["CWAgent", "DiskUtilization", "AutoScalingGroupName", var.eb_autoscaling_group_name, { stat = "Average" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "EC2 Disk Utilization (%)"
          yAxis = {
            left = {
              min = 0
              max = 100
            }
          }
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", var.alb_arn_suffix, { stat = "Sum" }]
          ]
          period = 300
          stat   = "Sum"
          region = var.aws_region
          title  = "Request Count"
        }
      },
      # HTTP 5xx Errors (Target Responses)
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "HTTPCode_Target_5XX_Count", "LoadBalancer", var.alb_arn_suffix, { stat = "Sum" }]
          ]
          period = 300
          stat   = "Sum"
          region = var.aws_region
          title  = "HTTP 5xx Errors"
        }
      },
      # RDS CPU Utilization
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", var.rds_instance_id, { stat = "Average" }]
          ]
          period = 300
          stat   = "Average"
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
      # RDS Read/Write IOPS
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/RDS", "ReadIOPS", "DBInstanceIdentifier", var.rds_instance_id, { stat = "Average", label = "Read IOPS" }],
            [".", "WriteIOPS", ".", ".", { stat = "Average", label = "Write IOPS" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "RDS Read/Write IOPS"
        }
      },
      # RDS Network Throughput
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/RDS", "NetworkReceiveThroughput", "DBInstanceIdentifier", var.rds_instance_id, { stat = "Average", label = "Network In" }],
            [".", "NetworkTransmitThroughput", ".", ".", { stat = "Average", label = "Network Out" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "RDS Network Throughput (Bytes/sec)"
        }
      },
      # RDS Database Connections
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier", var.rds_instance_id, { stat = "Average" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "RDS Database Connections"
        }
      },
      # RDS Freeable Memory
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/RDS", "FreeableMemory", "DBInstanceIdentifier", var.rds_instance_id, { stat = "Average" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "RDS Freeable Memory (Bytes)"
        }
      }
    ]
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
  alarm_actions       = [var.sns_topic_arn]

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
  threshold           = 10  # Alert if more than 10 5xx errors in 5 minutes
  alarm_description   = "High rate of HTTP 5xx errors indicates application issues"
  alarm_actions       = [var.sns_topic_arn]

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
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
