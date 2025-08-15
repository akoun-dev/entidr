import './LoadingAnimation.css';

export function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="content-placeholder">
        <div className="header-placeholder" />
        <div className="sidebar-placeholder" />
        <div className="main-content-placeholder">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card-placeholder" />
          ))}
        </div>
      </div>
    </div>
  );
}