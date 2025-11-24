'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from 'antd'
import { HomeOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons'
import { clearAuthTokens, isAuthenticated } from '@/lib/cookies'

const Home = () => {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    setAuthenticated(isAuthenticated())
  }, [])

  const handleLogout = async () => {
    try {
      clearAuthTokens()
      setAuthenticated(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div>
      <h1>Welcome to Unisync</h1>

      {/* {authenticated ? (
        <div>
          <Button type='primary' icon={<HomeOutlined />}>
            Home
          </Button>
          <Button danger onClick={handleLogout} style={{ marginLeft: '16px' }}>
            Logout
          </Button>
        </div>
      ) : (
        <div>
          <Button
            type='primary'
            icon={<LoginOutlined />}
            onClick={() => router.push('/auth/login')}
            style={{ marginRight: '16px' }}
          >
            Login
          </Button>
          <Button
            icon={<UserAddOutlined />}
            onClick={() => router.push('/auth/register')}
          >
            Register
          </Button>
        </div>
      )} */}
    </div>
  )
}

export default Home
