'use client'

import { Tabs } from 'antd'
import BuildingList from '@/components/venue/BuildingList'
import RoomList from '@/components/venue/RoomList'

const VenuePage = () => {
  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Venue Management</h1>
      <Tabs
        defaultActiveKey='buildings'
        items={[
          {
            key: 'buildings',
            label: 'Buildings',
            children: <BuildingList />,
          },
          {
            key: 'rooms',
            label: 'Rooms',
            children: <RoomList />,
          },
        ]}
      />
    </div>
  )
}

export default VenuePage
