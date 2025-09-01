import logoTitle from "@/src/config/logoTitle.js";
import website_name from "@/src/config/website.js";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="w-full mt-16">
      {/* Logo Section */}
      <div className="max-w-[1920px] mx-auto px-4">
        <div className="flex justify-center sm:justify-start items-center gap-6">
          <img
            src="/footer.png"
            alt={logoTitle}
            className="h-[100px] w-[200px] object-contain"
          />
        </div>
      </div>

      <div className="bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-[1920px] mx-auto px-4 py-6">
          {/* A-Z List Section */}
          <div className="mb-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 items-center sm:items-start">
              <h2 className="text-sm font-medium text-white">𝓐-𝓩 𝓛𝓘𝓢𝓣</h2>
              <span className="text-sm text-white/60">𝓑𝓻𝓸𝔀𝓼𝓮 𝓪𝓷𝓲𝓶𝓮 𝓪𝓵𝓹𝓱𝓪𝓫𝓮𝓽𝓲𝓬𝓪𝓵𝓵𝔂</span>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
              {["All", "#", "0-9", ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))].map((item, index) => (
                <Link
                  to={`az-list/${item === "All" ? "" : item}`}
                  key={index}
                  className="px-2.5 py-1 text-sm bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
            <div className="flex gap-4 flex-wrap justify-center sm:justify-start mt-4">
              <Link
                to="/terms-of-service"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/dmca"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                DMCA
              </Link>
              <Link
                to="/contact"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Legal Text */}
          <div className="space-y-2 text-sm text-white/40 text-center sm:text-left">
            <p className="max-w-4xl mx-auto sm:mx-0">
              {website_name} 𝖉𝖔𝖊𝖘 𝖓𝖔𝖙 𝖍𝖔𝖘𝖙 𝖆𝖓𝖞 𝖋𝖎𝖑𝖊𝖘, 𝖎𝖙 𝖒𝖊𝖗𝖊𝖑𝖞 𝖕𝖚𝖑𝖑𝖘 𝖘𝖙𝖗𝖊𝖆𝖒𝖘 𝖋𝖗𝖔𝖒
              3𝖗𝖉 𝖕𝖆𝖗𝖙𝖞 𝖘𝖊𝖗𝖛𝖎𝖈𝖊𝖘. 𝕷𝖊𝖌𝖆𝖑 𝖎𝖘𝖘𝖚𝖊𝖘 𝖘𝖍𝖔𝖚𝖑𝖉 𝖇𝖊 𝖙𝖆𝖐𝖊𝖓 𝖚𝖕 𝖜𝖎𝖙𝖍 𝖙𝖍𝖊 𝖋𝖎𝖑𝖊
              𝖍𝖔𝖘𝖙𝖘 𝖆𝖓𝖉 𝖕𝖗𝖔𝖛𝖎𝖉𝖊𝖗𝖘.{website_name} 𝖎𝖘 𝖓𝖔𝖙 𝖗𝖊𝖘𝖕𝖔𝖓𝖘𝖎𝖇𝖑𝖊 𝖋𝖔𝖗 𝖆𝖓𝖞 𝖒𝖊𝖉𝖎𝖆
              𝖋𝖎𝖑𝖊𝖘 𝖘𝖍𝖔𝖜𝖓 𝖇𝖞 𝖙𝖍𝖊 𝖛𝖎𝖉𝖊𝖔 𝖕𝖗𝖔𝖛𝖎𝖉𝖊𝖗𝖘.
            </p>
            <p>© {website_name}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
