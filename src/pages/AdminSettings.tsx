import FaviconManager from "@/components/FaviconManager";
import MercadoPagoSettings from "@/components/MercadoPagoSettings";

const AdminSettings = () => {
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <h1 className="text-lg font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Configurações
      </h1>

      {/* Favicon manager */}
      <FaviconManager />

      {/* Mercado Pago settings */}
      <MercadoPagoSettings />
    </div>
  );
};

export default AdminSettings;
