export function formatItemDescription(description) {
  return description
    .replace(/<mainText>/g, '<span class="item-mainText">')
    .replace(/<\/mainText>/g, "</span>")
    .replace(/<stats>/g, "<span>")
    .replace(/<\/stats>/g, "</span>")
    .replace(/<br\s*\/?>/g, "<br />")
    .replace(/<attention>/g, '<span class="item-attention">')
    .replace(/<\/attention>/g, "</span>")
    .replace(/<passive>/g, '<span class="item-passive">')
    .replace(/<\/passive>/g, "</span>")
    .replace(/<OnHit>/g, '<span class="item-onhit">')
    .replace(/<\/OnHit>/g, "</span>");
}
