import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

interface HintProps {
  children: React.ReactNode;
  message: string;
}
export const Hint = ({ children, message }: HintProps) => {
  return (
  <Tooltip>
    <TooltipTrigger asChild>
      {children}
    </TooltipTrigger>
    <TooltipContent>
      {message}
    </TooltipContent>
  </Tooltip>
  )
}
