import CurvedHeader from './CurvedHeader'

function Header({ title, subtitle, compact, rightSlot, children, allowOverflow = false }) {
  return (
    <CurvedHeader
      title={title}
      subtitle={subtitle}
      compact={compact}
      rightSlot={rightSlot}
      allowOverflow={allowOverflow}
    >
      {children}
    </CurvedHeader>
  )
}

export default Header
