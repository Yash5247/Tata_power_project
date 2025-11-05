export default function HomePage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '10px',
        padding: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>
          🔧 Predictive Maintenance Dashboard
        </h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          AI-powered monitoring system for energy infrastructure
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: '#10b981',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>24</div>
            <div>Total Equipment</div>
          </div>
          
          <div style={{
            background: '#3b82f6',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>18</div>
            <div>Healthy Devices</div>
          </div>
          
          <div style={{
            background: '#f59e0b',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>4</div>
            <div>At Risk</div>
          </div>
          
          <div style={{
            background: '#ef4444',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>2</div>
            <div>Critical</div>
          </div>
        </div>

        <div style={{
          background: '#f3f4f6',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#333', marginBottom: '15px' }}>System Status</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: '#10b981',
              borderRadius: '50%'
            }}></div>
            <span style={{ color: '#666' }}>All systems operational - Monitoring 24/7</span>
          </div>
        </div>

        <div style={{
          background: '#f3f4f6',
          padding: '20px',
          borderRadius: '8px'
        }}>
          <h2 style={{ color: '#333', marginBottom: '15px' }}>Recent Alerts</h2>
          <div style={{ color: '#666' }}>
            <div style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>
              ⚠️ Transformer #12 - Temperature above threshold
            </div>
            <div style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>
              ⚠️ Turbine #7 - Vibration anomaly detected
            </div>
            <div style={{ padding: '10px' }}>
              ✅ All other equipment operating normally
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
