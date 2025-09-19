export default function Loading() {
  return (
    <div className="container py-4">
      {/* Back button skeleton */}
      <div className="placeholder-glow mb-4">
        <span
          className="placeholder rounded-pill"
          style={{ width: "80px", height: "40px" }}
        />
      </div>

      {/* Game title skeleton */}
      <div className="text-center mb-4">
        <div className="placeholder-glow">
          <span className="placeholder col-6 mb-3" style={{ height: "2rem" }} />
        </div>
      </div>

      {/* Game player skeleton */}
      <div className="mb-5">
        <div className="placeholder-glow">
          <span
            className="placeholder col-12"
            style={{ height: "400px", borderRadius: "12px" }}
          />
        </div>
      </div>

      {/* More games skeleton */}
      <div className="mb-5">
        <h2 className="mb-4 text-center text-muted">More Games</h2>
        <div className="row">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="col-4 col-md-3 col-xl-2 mb-3">
              <div className="placeholder-glow">
                <span
                  className="placeholder col-12"
                  style={{ height: "120px", borderRadius: "12px" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
