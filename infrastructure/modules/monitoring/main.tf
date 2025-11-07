# Monitoring Module - CloudWatch Dashboards and Alarms

#############
# SNS Topic for Alerts
#############
resource "aws_sns_topic" "alerts" {
  name = "${var.project_name}-${var.environment}-alerts"

  tags = {
    Name        = "${var.project_name}-${var.environment}-alerts"
    Environment = var.environment
    Project     = var.project_name
  }
}

# TODO: Add email subscriptions
# resource "aws_sns_topic_subscription" "alerts_email" {
#   topic_arn = aws_sns_topic.alerts.arn
#   protocol  = "email"
#   endpoint  = "your-email@example.com"
# }

#############
# CloudWatch Dashboard
#############
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-${var.environment}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      # EB CPU Utilization
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ElasticBeanstalk", "EnvironmentHealth", { stat = "Average" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "Environment Health"
        }
      },
      # EB Memory Utilization
      {
        type = "metric"
        properties = {
          metrics = [
            ["CWAgent", "mem_used_percent", "AutoScalingGroupName", var.eb_autoscaling_group_name]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "Memory Utilization (%)"
        }
      },
      # EB Request Count
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ElasticBeanstalk", "RequestCount", { stat = "Sum" }]
          ]
          period = 300
          stat   = "Sum"
          region = var.aws_region
          title  = "Request Count"
        }
      },
      # RDS CPU
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", var.rds_instance_id]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "RDS CPU Utilization"
        }
      },
      # RDS Connections
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier", var.rds_instance_id]
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
            ["AWS/RDS", "FreeableMemory", "DBInstanceIdentifier", var.rds_instance_id]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "RDS Freeable Memory"
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
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    AutoScalingGroupName = var.eb_autoscaling_group_name
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# NOTE: Memory alarms below require CloudWatch Agent to be installed on EB instances.
# To enable memory monitoring:
# 1. Create .ebextensions/cloudwatch-agent.config in your app
# 2. Follow AWS docs: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Install-CloudWatch-Agent.html
# 3. Uncomment the alarms below

# High Memory Alarm (requires CloudWatch Agent) - COMMENTED OUT
# Uncomment after installing CloudWatch Agent
/*
resource "aws_cloudwatch_metric_alarm" "eb_memory_high" {
  alarm_name          = "${var.project_name}-${var.environment}-eb-memory-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "mem_used_percent"
  namespace           = "CWAgent"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "This metric monitors EC2 memory utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    AutoScalingGroupName = var.eb_autoscaling_group_name
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}
*/

# Critical Memory Alarm (requires CloudWatch Agent) - COMMENTED OUT
# Uncomment after installing CloudWatch Agent
/*
resource "aws_cloudwatch_metric_alarm" "eb_memory_critical" {
  alarm_name          = "${var.project_name}-${var.environment}-eb-memory-critical"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "mem_used_percent"
  namespace           = "CWAgent"
  period              = 300
  statistic           = "Average"
  threshold           = 90
  alarm_description   = "This metric monitors EC2 memory utilization - CRITICAL"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    AutoScalingGroupName = var.eb_autoscaling_group_name
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}
*/

# Environment Health Alarm
resource "aws_cloudwatch_metric_alarm" "eb_environment_health" {
  alarm_name          = "${var.project_name}-${var.environment}-eb-health-degraded"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "EnvironmentHealth"
  namespace           = "AWS/ElasticBeanstalk"
  period              = 300
  statistic           = "Average"
  threshold           = 15  # Healthy = 25, Warning = 15, Degraded = 10
  alarm_description   = "Environment health is degraded"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    EnvironmentName = var.eb_environment_name
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
