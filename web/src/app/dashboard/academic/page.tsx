'use client'

import { Tabs } from 'antd'
import DepartmentList from '@/components/academic/DepartmentList'
import CourseList from '@/components/academic/CourseList'
import BatchList from '@/components/academic/BatchList'
import SectionList from '@/components/academic/SectionList'
import CourseOfferingList from '@/components/academic/CourseOfferingList'
import ClassRepresentativeList from '@/components/academic/ClassRepresentativeList'
import UserEnrollmentList from '@/components/academic/UserEnrollmentList'

const AcademicPage = () => {
  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Academic Management</h1>
      <Tabs
        defaultActiveKey='departments'
        items={[
          {
            key: 'departments',
            label: 'Departments',
            children: <DepartmentList />,
          },
          {
            key: 'courses',
            label: 'Courses',
            children: <CourseList />,
          },
          {
            key: 'batches',
            label: 'Batches',
            children: <BatchList />,
          },
          {
            key: 'sections',
            label: 'Sections',
            children: <SectionList />,
          },
          {
            key: 'course-offerings',
            label: 'Course Offerings',
            children: <CourseOfferingList />,
          },
          {
            key: 'class-representatives',
            label: 'Class Representatives',
            children: <ClassRepresentativeList />,
          },
          {
            key: 'user-enrollments',
            label: 'User Enrollments',
            children: <UserEnrollmentList />,
          },
        ]}
      />
    </div>
  )
}

export default AcademicPage
