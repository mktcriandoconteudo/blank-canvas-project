import { Instagram, Facebook, Youtube, Mail, MapPin, Phone, Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const ALL_KEYS = [
  "footer_company_name", "footer_company_subtitle", "footer_description",
  "footer_about", "footer_phone", "footer_email", "footer_address",
  "footer_cnpj", "footer_copyright", "footer_tagline",
  "social_instagram", "social_facebook", "social_youtube",
];

const Footer = () => {
  const [s, setS] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ALL_KEYS)
      .then(({ data }) => {
        const map: Record<string, string> = {};
        data?.forEach((r) => (map[r.key] = r.value));
        setS(map);
      });
  }, []);

  const companyName = s.footer_company_name || "Caldas Resorts";
  const subtitle = s.footer_company_subtitle || "J G Locações";
  const description = s.footer_description || "Sua experiência perfeita em Caldas Novas começa aqui. Apartamentos completos com águas termais e muito conforto.";
  const about = s.footer_about || "Somos especializados em locações de temporada em Caldas Novas - GO. Oferecemos apartamentos em condomínios com estrutura completa de lazer e águas termais naturais.";
  const phone = s.footer_phone || "(62) 99999-9999";
  const email = s.footer_email || "contato@caldasresorts.com";
  const address = s.footer_address || "Caldas Novas - GO, Brasil";
  const cnpj = s.footer_cnpj || "00.000.000/0001-00";
  const copyright = s.footer_copyright || "Caldas Resorts — J G Locações";
  const tagline = s.footer_tagline || "Feito com ❤️ em Caldas Novas";

  const phoneClean = phone.replace(/\D/g, "");

  const socialLinks = [
    { key: "social_instagram", icon: Instagram },
    { key: "social_facebook", icon: Facebook },
    { key: "social_youtube", icon: Youtube },
  ].filter((l) => s[l.key]);

  return (
    <footer className="bg-[hsl(220,20%,10%)] text-white/80">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {companyName}
            </h3>
            <p className="text-xs text-white/50">{subtitle}</p>
            <p className="text-sm leading-relaxed">{description}</p>
            {socialLinks.length > 0 && (
              <div className="flex gap-3 pt-1">
                {socialLinks.map(({ key, icon: Icon }) => (
                  <a key={key} href={s[key]} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Sobre Nós */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Sobre Nós</h4>
            <p className="text-sm leading-relaxed">{about}</p>
          </div>

          {/* Fale Conosco */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Fale Conosco</h4>
            <div className="space-y-3">
              <a href={`tel:+55${phoneClean}`} className="flex items-center gap-2.5 text-sm hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-white/50 shrink-0" />
                {phone}
              </a>
              <a href={`mailto:${email}`} className="flex items-center gap-2.5 text-sm hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-white/50 shrink-0" />
                {email}
              </a>
            </div>
          </div>

          {/* Informações */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Informações</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-sm">
                <MapPin className="w-4 h-4 text-white/50 shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
              <div className="flex items-start gap-2.5 text-sm">
                <Building2 className="w-4 h-4 text-white/50 shrink-0 mt-0.5" />
                <span>CNPJ: {cnpj}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} {copyright}. Todos os direitos reservados.
          </p>
          <p className="text-xs text-white/30">{tagline}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
