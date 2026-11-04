import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { getCategories, getStoreSettings } from "@/lib/data/catalog";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [categories, settings] = await Promise.all([getCategories(), getStoreSettings()]);
  return (
    <>
      <Header announcement={settings.announcement} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer categories={categories} closingTime={settings.closingTime} />
      <WhatsAppFloat />
      <CartDrawer />
    </>
  );
}
