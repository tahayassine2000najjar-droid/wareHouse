export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <p className="footer-brand">WarehouseOS</p>
        <p className="footer-copy">&copy; {currentYear} All rights reserved.</p>
      </div>
    </footer>
  );
}
