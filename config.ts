const config = {
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'http://localhost:3000' 
    : 'http://localhost:3000'
}

export default config

