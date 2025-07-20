'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

const FooterWrapper = () => {
  const pathname = usePathname();

  const shouldHideFooterOn = pathname.startsWith("/dashboard");

  if (shouldHideFooterOn) return null;

  return <Footer />;
};

export default FooterWrapper;


