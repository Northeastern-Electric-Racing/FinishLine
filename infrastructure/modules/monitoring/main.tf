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
            [{ expression = "SELECT AVG(MemoryUtilization) FROM \"CWAgent\"", id = "m1" }]
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
      # EC2 Disk Utilization (Custom Metric) - Root filesystem
      {
        type = "metric"
        properties = {
          metrics = [
            [{ expression = "SELECT AVG(DiskUtilization) FROM \"CWAgent\" WHERE path = '/'", id = "m1" }]
          ]
          period = 300
          region = var.aws_region
          title  = "EC2 Disk Utilization (%) - Root"
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
      },
      # RDS Read/Write Latency
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/RDS", "ReadLatency", "DBInstanceIdentifier", var.rds_instance_id, { stat = "Average", label = "Read Latency" }],
            [".", "WriteLatency", ".", ".", { stat = "Average", label = "Write Latency" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "RDS Read/Write Latency (ms)"
        }
      },
      # RDS Queue Depth
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/RDS", "DiskQueueDepth", "DBInstanceIdentifier", var.rds_instance_id, { stat = "Average" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "RDS Disk Queue Depth"
        }
      },
      # RDS Throughput (MB/s)
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/RDS", "ReadThroughput", "DBInstanceIdentifier", var.rds_instance_id, { stat = "Average", label = "Read Throughput" }],
            [".", "WriteThroughput", ".", ".", { stat = "Average", label = "Write Throughput" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "RDS Disk Throughput (Bytes/sec)"
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
# RDS CloudWatch Alarms
#############

# High RDS CPU Alarm
resource "aws_cloudwatch_metric_alarm" "rds_cpu_high" {
  alarm_name          = "${var.project_name}-${var.environment}-rds-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 75
  alarm_description   = "RDS CPU utilization is high - may need optimization or larger instance"
  alarm_actions       = [var.sns_topic_arn]

  dimensions = {
    DBInstanceIdentifier = var.rds_instance_id
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# High RDS Read Latency Alarm
resource "aws_cloudwatch_metric_alarm" "rds_read_latency_high" {
  alarm_name          = "${var.project_name}-${var.environment}-rds-read-latency-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "ReadLatency"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 0.01  # 10ms in seconds
  alarm_description   = "RDS read latency is high - may indicate I/O bottleneck or need for indexing"
  alarm_actions       = [var.sns_topic_arn]

  dimensions = {
    DBInstanceIdentifier = var.rds_instance_id
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# Low RDS Freeable Memory Alarm
resource "aws_cloudwatch_metric_alarm" "rds_memory_low" {
  alarm_name          = "${var.project_name}-${var.environment}-rds-memory-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "FreeableMemory"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 524288000  # 500MB in bytes
  alarm_description   = "RDS freeable memory is low - may need larger instance or query optimization"
  alarm_actions       = [var.sns_topic_arn]

  dimensions = {
    DBInstanceIdentifier = var.rds_instance_id
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# High Memory Alarm
resource "aws_cloudwatch_metric_alarm" "eb_memory_high" {
  alarm_name          = "${var.project_name}-${var.environment}-eb-memory-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  threshold           = 75
  alarm_description   = "This metric monitors EC2 memory utilization"
  alarm_actions       = [var.sns_topic_arn]

  metric_query {
    id          = "m1"
    return_data = true
    metric {
      namespace   = "CWAgent"
      metric_name = "MemoryUtilization"
      period      = 300
      stat        = "Average"
      dimensions = {
        AutoScalingGroupName = var.eb_autoscaling_group_name
      }
    }
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
