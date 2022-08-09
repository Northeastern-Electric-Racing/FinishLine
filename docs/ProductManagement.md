# Product Management

Product Management documentation for the NER PM Dashboard v2.

## Table of Contents

- [Document Purpose](https://github.com/Northeastern-Electric-Racing/PM-Dashboard-v2/blob/main/Docs/ProductManagement.md#document-purpose)
- [Product Purpose](https://github.com/Northeastern-Electric-Racing/PM-Dashboard-v2/blob/main/Docs/ProductManagement.md#product-purpose)
- [Product History](https://github.com/Northeastern-Electric-Racing/PM-Dashboard-v2/blob/main/Docs/ProductManagement.md#product-history)
- [Users](https://github.com/Northeastern-Electric-Racing/PM-Dashboard-v2/blob/main/Docs/ProductManagement.md#users)
- [Features](https://github.com/Northeastern-Electric-Racing/PM-Dashboard-v2/blob/main/Docs/ProductManagement.md#features)
- [Metrics](https://github.com/Northeastern-Electric-Racing/PM-Dashboard-v2/blob/main/Docs/ProductManagement.md#metrics)
- [Business Value](https://github.com/Northeastern-Electric-Racing/PM-Dashboard-v2/blob/main/Docs/ProductManagement.md#business-value)
- [Key Resources](https://github.com/Northeastern-Electric-Racing/PM-Dashboard-v2/blob/main/Docs/ProductManagement.md#key-resources)
- [Risks](https://github.com/Northeastern-Electric-Racing/PM-Dashboard-v2/blob/main/Docs/ProductManagement.md#risks)

## Document Purpose

The purpose of this document is to thoroughly record the purpose, metrics, and roadmap for the Northeastern Electric Racing Project Management Dashboard website (“NER PM Dashboard”).
This document will help articulate the why and what behind the product, the motivation for building it, and the impact that it should have on the team.

## Product Purpose

The NER PM Dashboard is intended to assist NER’s Project Management Office (PMO) and other leadership with increasing efficiency in two aspects:

1. understanding the state of the club’s projects and
2. handling the processes and procedures associated with a formal project and change management system

## Product History

The NER PM Dashboard v1 was created in July of 2020 as a Google Apps Script web application attached to the database Google Sheet file.
Major development took place during July and August prior to the start of the Fall 2020 semester.
During Fall 2020, two developers make incremental improvements, and then in Spring 2020 a team of developers was formed.

The NER PM Dashboard v2 was hypothesized during the Fall 2020 semester as the v1 developers ran into platform and framework limitations.
Research, planning, and project initiation for v2 began in Spring 2021.
The end of Summer 2021 was selected as the initial launch deadline for v2, but was not met.
In Fall 2021, the team of developers was formalized into NER's Software Solutions team and grew to 20+ members.
January 18, 2022 was selected as the adjusted launch deadline for v2, but was yet again not met.
In Spring 2022, the Software Solutions team grew to 70+ members.
The application finally launched in May of 2022.

## Users

The NER PM Dashboard’s primary users are NER’s Project Leads, PMO members, and other NER leadership.
These three user segments will likely give rise to specific application user profiles.
Below is a list of the focus and priorities for each user group:

- Project Leads
  - The one or two projects they are assigned to lead
  - The expectations for what should be done for those projects
  - Submitting the necessary updates to those projects
- PMO members
  - The few projects that they are responsible for
  - Understanding upcoming deadlines
  - Both submitting and processing change requests
- Other NER leadership
  - Seeing a general view of active projects
  - Drilling down into project details as is necessary

## Features

The key features and feature categories for the NER PM Dashboard application are described in a separate [Requirements document](https://github.com/Northeastern-Electric-Racing/PM-Dashboard-v2/blob/main/Docs/Requirements.md).

## Metrics

Metrics that are important and relevant to the NER PM Dashboard are as follows:

- Change request turnaround time
  - Measured as the average duration between a change request being submitted and fully implemented
  - One of the primary metrics that the NER PM Dashboard should help improve
  - Lower turnaround time helps keep the PM System accurate and up-to-date
- Weekly active users
  - Measured as the total number of users who have logged in within the last 7 days
  - A secondary metric that the NER PM Dashboard should help improve
  - Higher weekly active users represents more club members interacting with the PM System, thereby increasing awareness and understanding of project activities and expectations
- Change requests citing estimation issues
  - Measured as the total number of change requests which include "Estimation Issues" as a reason / cause in the last 90 days
  - A minor extended metric that the NER PM Dashboard will hopefully help improve
  - Fewer change requests being submitted due to estimation errors represents more accurate planning of projects and work packages, making it easier to manage and monitor the portfolio of projects
  - Estimation errors are highly dependent on the human element of project planning; the NER PM Dashboard is intended to provide increased information specificity, clarity, and transparency
- Work package delays
  - Measured as the average percent increase in work package duration as a result of a change request containing a timeline impact element over the last 12 months
  - Fewer work package delays represents both more accurate duration estimations and fewer timeline-impacting issues cropping up
  - A metric that the NER PM Dashboard will primarily serve to help measure

## Business Value

The value of the NER PM Dashboard is in increaseing the accuracy, efficiency, and effectiveness of NER's Project Management System.

The NER PM Dashboard also serves as an engaging learning environment for club members intersted in learning about the design and development of professional-scale web applicatioons.

## Key Resources

Key resources needed for the success of the NER PM Dashboard include student software engineers, software student mentors, cloud computing, project management expertise, and buy-in from the club's engineering leadership.

The development of the NER PM Dashboard is primarily driven by the efforts of a team of volunteer student software engineers.
Without those engineers, the NER PM Dashboard would never be able to achieve the development milestones key for the application's success.

As a warm and welcoming education-first team, many interested team members lack the neccessary skills and knowledge to effectively contribute to the project.
The teaching, mentorship, and support that the software student mentors will provide to newer student software engineers will be key for the success of the project.

As a cloud-native web-application, cloud computing resources will be utilized for the deployment of the NER PM Dashboard.

Project management expertise, especially pertaining to the club's project management system, will be critical to ensure new features, enhancements, and bug fixes are created and implemented for the best.

## Risks

The key risks associated with the NER PM Dashboard v2 project are related to team members and expertise.

Attracting and retaining committed team members to contribute to the project has proven to be difficult from experience with the NER PM Dashboard v1 and the first 6 months of the NEW PM Dashboard v2.
Additionally, having team members that are experts in both the club's project management system and software development is close to impossible.

Mitigation efforts primarily surround engaging the club's Outreach team to pursue student outreach to Khoury College students and holding learning sessions to teach project team members about the club's project management system.
