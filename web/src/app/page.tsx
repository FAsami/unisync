'use client'

import React from 'react'
import Image from 'next/image'
import { Button, Layout, Typography, Card, Row, Col, Space } from 'antd'
import {
  AppleOutlined,
  AndroidOutlined,
  ScheduleOutlined,
  BellOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'

const { Header, Content, Footer } = Layout
const { Title, Paragraph, Text } = Typography

const Home = () => {
  return (
    <Layout
      className='layout'
      style={{ minHeight: '100vh', background: '#fff' }}
    >
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#fff',
          boxShadow: '0 2px 8px #f0f1f2',
          padding: '0 50px',
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', marginRight: 'auto' }}
        >
          <div
            style={{
              position: 'relative',
              width: 40,
              height: 40,
              marginRight: 10,
            }}
          >
            <Image
              src='/logo.png'
              alt='Unisync Logo'
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
          <Title level={4} style={{ margin: 0 }}>
            Unisync
          </Title>
        </div>
        <Space>{/* Placeholder for future nav links if needed */}</Space>
      </Header>

      <Content>
        {/* Hero Section */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '100px 50px',
            textAlign: 'center',
          }}
        >
          <Row justify='center' align='middle' gutter={[48, 48]}>
            <Col xs={24} md={12} lg={10}>
              <div style={{ textAlign: 'left' }}>
                <Title style={{ fontSize: '3rem', marginBottom: '20px' }}>
                  Your Academic Companion
                </Title>
                <Paragraph
                  style={{
                    fontSize: '1.2rem',
                    color: '#555',
                    marginBottom: '30px',
                  }}
                >
                  Streamline your academic life with real-time updates on class
                  routines, venues, and instant notifications. Everything you
                  need, synced.
                </Paragraph>
                <Space size='middle'>
                  <Button
                    type='primary'
                    size='large'
                    icon={<AppleOutlined />}
                    href='#'
                  >
                    App Store
                  </Button>
                  <Button
                    type='default'
                    size='large'
                    icon={<AndroidOutlined />}
                    href='#'
                  >
                    Play Store
                  </Button>
                </Space>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8}>
              {/*  Placeholder for App Screenshot or abstract visual */}
              <div
                style={{
                  width: '100%',
                  height: '400px',
                  background: 'rgba(255,255,255,0.5)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed #ccc',
                }}
              >
                <Text type='secondary'>App Screenshot / Visual</Text>
              </div>
            </Col>
          </Row>
        </div>

        {/* Features Section */}
        <div
          style={{ padding: '80px 50px', maxWidth: '1200px', margin: '0 auto' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <Title level={2}>Why Unisync?</Title>
            <Text type='secondary'>
              Features designed to make your student life easier
            </Text>
          </div>

          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
                <ScheduleOutlined
                  style={{
                    fontSize: '48px',
                    color: '#1890ff',
                    marginBottom: '20px',
                  }}
                />
                <Title level={4}>Class Routines</Title>
                <Paragraph>
                  Access your personalized class schedule instantly. Never miss
                  a class with up-to-date timings.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
                <BellOutlined
                  style={{
                    fontSize: '48px',
                    color: '#52c41a',
                    marginBottom: '20px',
                  }}
                />
                <Title level={4}>Instant Notifications</Title>
                <Paragraph>
                  Get real-time alerts for class cancellations, rescheduling,
                  and important announcements.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
                <EnvironmentOutlined
                  style={{
                    fontSize: '48px',
                    color: '#fa8c16',
                    marginBottom: '20px',
                  }}
                />
                <Title level={4}>Venue Info</Title>
                <Paragraph>
                  Find your classmates and classrooms easily with detailed venue
                  information.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
        Unisync ©{new Date().getFullYear()} Created by Pibyi
      </Footer>
    </Layout>
  )
}

export default Home
