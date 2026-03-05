// src/components/ui/MessageContent.tsx

import { useNavigate } from "react-router-dom";
import { FileText, BookOpen, ExternalLink } from "lucide-react";
import React from "react";

interface MessageContentProps {
  content: string;
}

const MessageContent = ({ content }: MessageContentProps) => {
  const navigate = useNavigate();

  const handleLinkClick = (type: string, id: string) => {
    console.log(`🔗 Navigation vers ${type}:${id}`);
    
    if (type === "resource") {
      navigate(`/e-fri/ressources?highlight=${id}`);
    } else if (type === "cours") {
      navigate(`/e-fri/cours-pratiques?highlight=${id}`);
    }
  };

  // ─── Formater le texte inline (gras, italique, liens internes) ───
  const formatInlineText = (text: string, keyPrefix: string): React.ReactNode[] => {
    // Regex pour détecter nos liens custom [texte](resource:id) ou [texte](cours:id)
    // Supporte les UUIDs (avec tirets) et les IDs numériques
    const linkRegex = /\[([^\]]+)\]\((resource|cours):([a-zA-Z0-9_-]+)\)/g;

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Texte avant le lien → on le formate (gras/italique)
      if (match.index > lastIndex) {
        const before = text.substring(lastIndex, match.index);
        elements.push(...formatBoldItalic(before, `${keyPrefix}-pre-${match.index}`));
      }

      const [, linkText, type, id] = match;

      // Bouton cliquable
      elements.push(
        <button
          key={`${keyPrefix}-link-${type}-${id}-${match.index}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLinkClick(type, id);
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 mx-0.5
                     bg-blue-500/10 hover:bg-blue-500/20 
                     text-blue-600 dark:text-blue-400 
                     font-medium text-sm
                     rounded-lg transition-all duration-200
                     border border-blue-500/20 hover:border-blue-500/40
                     hover:shadow-md hover:-translate-y-0.5 
                     cursor-pointer group"
          title={`Ouvrir ${type === "resource" ? "la ressource" : "le cours pratique"}`}
        >
          {type === "resource" ? (
            <FileText size={14} className="flex-shrink-0 text-blue-500" />
          ) : (
            <BookOpen size={14} className="flex-shrink-0 text-purple-500" />
          )}
          <span className="underline decoration-blue-400/40 group-hover:decoration-blue-500 underline-offset-2">
            {linkText}
          </span>
          <ExternalLink size={10} className="flex-shrink-0 opacity-50 group-hover:opacity-100" />
        </button>
      );

      lastIndex = match.index + match[0].length;
    }

    // Texte restant après le dernier lien
    if (lastIndex < text.length) {
      elements.push(...formatBoldItalic(text.substring(lastIndex), `${keyPrefix}-post-${lastIndex}`));
    }

    // Si aucun lien trouvé, formater tout le texte
    if (elements.length === 0) {
      return formatBoldItalic(text, keyPrefix);
    }

    return elements;
  };

  // ─── Formater gras et italique ───
  const formatBoldItalic = (text: string, keyPrefix: string): React.ReactNode[] => {
    // **gras** puis *italique*
    const boldRegex = /\*\*([^*]+)\*\*/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const before = text.substring(lastIndex, match.index);
        elements.push(...formatItalic(before, `${keyPrefix}-b-pre-${match.index}`));
      }
      elements.push(
        <strong key={`${keyPrefix}-bold-${match.index}`} className="font-semibold">
          {match[1]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      elements.push(...formatItalic(text.substring(lastIndex), `${keyPrefix}-b-post`));
    }

    if (elements.length === 0) {
      return formatItalic(text, keyPrefix);
    }

    return elements;
  };

  // ─── Formater italique seul ───
  const formatItalic = (text: string, keyPrefix: string): React.ReactNode[] => {
    const italicRegex = /\*([^*]+)\*/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = italicRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(
          <span key={`${keyPrefix}-i-pre-${match.index}`}>
            {text.substring(lastIndex, match.index)}
          </span>
        );
      }
      elements.push(
        <em key={`${keyPrefix}-italic-${match.index}`} className="italic">
          {match[1]}
        </em>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      elements.push(
        <span key={`${keyPrefix}-i-post`}>
          {text.substring(lastIndex)}
        </span>
      );
    }

    if (elements.length === 0) {
      return [<span key={keyPrefix}>{text}</span>];
    }

    return elements;
  };

  // ─── Rendu principal ───
  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Ligne vide → espacement
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Titre markdown ### ou ##
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="font-bold text-base mt-3 mb-1">
              {formatInlineText(trimmed.replace("### ", ""), `h3-${idx}`)}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className="font-bold text-lg mt-3 mb-1">
              {formatInlineText(trimmed.replace("## ", ""), `h2-${idx}`)}
            </h3>
          );
        }

        // Liste à puces (- ou *)
        if (/^[-*•]\s/.test(trimmed)) {
          const bulletContent = trimmed.replace(/^[-*•]\s+/, "");
          return (
            <div key={idx} className="flex gap-2 ml-2">
              <span className="text-blue-500 mt-0.5 flex-shrink-0">•</span>
              <span className="flex-1 flex flex-wrap items-center gap-y-1">
                {formatInlineText(bulletContent, `li-${idx}`)}
              </span>
            </div>
          );
        }

        // Liste numérotée (1. 2. etc.)
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numberedMatch) {
          return (
            <div key={idx} className="flex gap-2 ml-2">
              <span className="text-blue-500 font-semibold flex-shrink-0 min-w-[1.2rem] text-right">
                {numberedMatch[1]}.
              </span>
              <span className="flex-1 flex flex-wrap items-center gap-y-1">
                {formatInlineText(numberedMatch[2], `ol-${idx}`)}
              </span>
            </div>
          );
        }

        // Paragraphe normal
        return (
          <p key={idx} className="flex flex-wrap items-center gap-y-1">
            {formatInlineText(trimmed, `p-${idx}`)}
          </p>
        );
      })}
    </div>
  );
};

export default MessageContent;