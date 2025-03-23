import { Text, useMantineTheme } from "@mantine/core"
import { Dumbbell } from "lucide-react"
import { useTranslation } from "react-i18next"

interface LogoProps {
  size?: "sm" | "md" | "lg"
}

const sizes = {
  sm: { icon: 24, text: "sm" },
  md: { icon: 32, text: "md" },
  lg: { icon: 48, text: "xl" },
}

export function Logo({ size = "md" }: LogoProps) {
  const { t } = useTranslation()
  const theme = useMantineTheme()

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Dumbbell 
        size={sizes[size].icon} 
        color={theme.colorScheme === "dark" ? theme.white : theme.colors.gray[9]} 
      />
      <Text
        size={sizes[size].text}
        weight={800}
        color={theme.colorScheme === "dark" ? theme.white : theme.colors.gray[9]}
      >
       Goodlift
      </Text>
    </div>
  )
} 