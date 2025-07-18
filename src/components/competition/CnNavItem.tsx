import { NavItem } from '@/components/dashboard/NavItem';
import { NavItemProps } from '@/components/dashboard/NavItem';

export function CnNavItem({ item, isMobile = false, badge }: NavItemProps) {
  return (
    <NavItem 
      item={item} 
      isMobile={isMobile} 
      badge={badge} 
      baseRoute="/competition" 
    />
  );
}

export type { NavItemProps };