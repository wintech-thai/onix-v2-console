import { OrgSwitcher } from "@/components/ui/org-switcher"
import { UserButton } from "@/components/ui/user-button"

type Props = {
  isExpand: boolean
}
export const Navbar = ({
  isExpand,
}: Props) => {

  return (
    <div style={{
      paddingLeft: isExpand ? 256 : 80,
      transition: "padding-left 0.2s",
    }} className="h-16 border-b">
      <div className="h-full flex items-center justify-between px-4">
        <OrgSwitcher />
        <UserButton />
      </div>
    </div>
  )
}
