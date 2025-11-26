'use client'

import { Tabs } from 'antd'
import RoutineList from '@/components/routine/RoutineList'
import RoutineExceptionList from '@/components/routine/RoutineExceptionList'

const RoutinePage = () => {
    return (
        <div>
            <h1 style={{ marginBottom: 24 }}>Routine Management</h1>
            <Tabs
                defaultActiveKey='routines'
                items={[
                    {
                        key: 'routines',
                        label: 'Routines',
                        children: <RoutineList />,
                    },
                    {
                        key: 'exceptions',
                        label: 'Routine Exceptions',
                        children: <RoutineExceptionList />,
                    },
                ]}
            />
        </div>
    )
}

export default RoutinePage
