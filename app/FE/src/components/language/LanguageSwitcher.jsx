// components/language/LanguageSwitcher.jsx
// Nút chuyển ngôn ngữ nhỏ gọn — dùng SettingsContext (i18n-backed), KHÔNG cần react-i18next

import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useSettings, LANGUAGES } from "../../context/SettingsContext";
import "./language.css";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="lang-switcher" ref={dropdownRef}>
      <button
        type="button"
        className="lang-switcher__btn"
        onClick={() => setIsOpen((v) => !v)}
        title="Đổi ngôn ngữ / Change language"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Globe size={14} className="lang-switcher__icon" />
        <span className="lang-switcher__flag">{activeLang.flag}</span>
        <span className="lang-switcher__code">{activeLang.code.toUpperCase()}</span>
        <ChevronDown
          size={12}
          className={`lang-switcher__arrow ${isOpen ? "is-open" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="lang-switcher__dropdown" role="listbox">
          <div className="lang-switcher__dropdown-header">
            Ngôn ngữ / Language
          </div>

          {LANGUAGES.map((item) => (
            <button
              key={item.code}
              type="button"
              role="option"
              aria-selected={language === item.code}
              className={`lang-switcher__option ${language === item.code ? "is-active" : ""}`}
              onClick={() => handleSelect(item.code)}
            >
              <span className="lang-switcher__option-flag">{item.flag}</span>
              <div className="lang-switcher__option-text">
                <span className="lang-switcher__option-label">{item.label}</span>
                <span className="lang-switcher__option-native">{item.native}</span>
              </div>
              {language === item.code && (
                <Check size={14} className="lang-switcher__check" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
