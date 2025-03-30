'use client'

import { Button, Card, Space } from 'antd'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <Card className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Next.js + Ant Design + Tailwind CSS
        </h1>
        <Space direction="vertical" className="w-full">
          <Button type="primary" className="w-full">
            Primary Button
          </Button>
          <Button className="w-full">Default Button</Button>
          <div className="bg-blue-500 text-white p-4 rounded">
            Tailwind Styled Div
          </div>
        </Space>
      </Card>
    </main>
  )
}
