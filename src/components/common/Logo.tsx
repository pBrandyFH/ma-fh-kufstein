import { Group, Text, rem } from "@mantine/core"
import { Dumbbell } from "lucide-react"

interface LogoProps {
  size?: "sm" | "md" | "lg"
}

export function Logo({ size = "md" }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: 20 },
    md: { icon: 32, text: 24 },
    lg: { icon: 40, text: 32 },
  }

  return (
    <Group spacing="xs" noWrap>
      <Dumbbell size={sizes[size].icon} color="white" />
      <Text
        size={sizes[size].text}
        fw={900}
        c="white"
        style={{
          letterSpacing: rem(-1),
        }}
      >
        GoodLift
      </Text>
    </Group>
  )
} 