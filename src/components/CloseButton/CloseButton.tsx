import { Button, ButtonProps } from "@/components/ui/button"
import { Cross1Icon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"

interface CloseButtonProps extends ButtonProps {}

export function CloseButton({ className, ...props }: CloseButtonProps) {
  return (
    <Button
      variant="ghost"
      className={cn("justify-self-end self-start p-1 w-fit h-fit duration-400 ease-in", className)}
      {...props}
    >
      <Cross1Icon />
    </Button>
  )
}
