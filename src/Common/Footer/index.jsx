import LogoOdyseeSavoir from '../../Utils/Logo/Logo_odyseedusavoir.webp';
import './footer.scss';
function Footer() {
  return (
      <footer className="home-footer">
          <div className="footer-section">
              <h3>🌟 Découvrez aussi</h3>
              <a
                  href="https://solarusweb.ovh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
              >
                  <img src={LogoOdyseeSavoir} alt="Odyssée du Savoir" className="footer-logo" />
                  <div className="footer-link-content">
                      <strong>Odyssée du Savoir</strong>
                      <span>Éducation CP à la 3ème</span>
                  </div>
              </a>
          </div>
          <div className="footer-copyright">
              <p>© 2025 Solarus Actus - Tous droits réservés</p>
          </div>
      </footer>
  );
}

export default Footer;