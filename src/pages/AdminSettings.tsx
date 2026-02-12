import FaviconManager from "@/components/FaviconManager";
import MercadoPagoSettings from "@/components/MercadoPagoSettings";
import HeroBannerManager from "@/components/HeroBannerManager";
import LandingPageManager from "@/components/LandingPageManager";
import GoogleOAuthGuide from "@/components/GoogleOAuthGuide";
import FooterSettingsManager from "@/components/FooterSettingsManager";

const AdminSettings = () => {
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <h1 className="text-lg font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Configurações
      </h1>

      {/* Landing Page manager */}
      <LandingPageManager />

      {/* Hero Banner manager */}
      <HeroBannerManager />

      {/* Favicon manager */}
      <FaviconManager />

      {/* Mercado Pago settings */}
      <MercadoPagoSettings />

      {/* Footer / Redes Sociais */}
      <FooterSettingsManager />

      {/* Google OAuth guide */}
      <GoogleOAuthGuide />
    </div>
  );
};

export default AdminSettings;
