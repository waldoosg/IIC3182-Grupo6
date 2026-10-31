import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"

export function Missing({ title, description }: { title: string; description: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild size="lg">
          <Link to="/">Ir al inicio</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
