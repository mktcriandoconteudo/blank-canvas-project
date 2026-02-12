import OptionsManager from "@/components/OptionsManager";
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

      {/* Options managers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <OptionsManager category="amenity" title="Comodidades" />
        <OptionsManager category="condo_feature" title="O que o lugar oferece" />
        <OptionsManager category="important_info" title="Informações Importantes" />
      </div>
    </div>
  );
};

export default AdminSettings;
