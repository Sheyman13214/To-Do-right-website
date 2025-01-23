import dynamic from "next/dynamic"
import React from "react"

const ToDoRight = dynamic(() => import("../components/ToDoRight"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
})

export default function Home() {
  return <ToDoRight />
}
