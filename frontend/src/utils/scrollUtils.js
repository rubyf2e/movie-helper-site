export function handleLinkClick(
  index,
  event,
  targetId,
  setActiveLink,
  setMenuOpen,
  headerHeight
) {
  event.preventDefault();
  setActiveLink(index);
  setMenuOpen(false);

  const targetElement = document.getElementById(targetId);
  if (targetElement) {
    const targetPosition = targetElement.offsetTop - headerHeight;
    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });
  }
}
