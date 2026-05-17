const swaggerJsdoc = require('swagger-jsdoc');

function loadApiDoc(server) {
  return swaggerJsdoc({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Platform API Server',
        version: '1.0.0',
        description: 'Platform API 서버 - 게시판, 사용자, 메뉴 관리'
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT 토큰을 Authorization 헤더에 입력하세요'
          },
          cookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'connect.sid',
            description: '세션 쿠키 인증'
          }
        }
      },
      security: [
        {
          bearerAuth: []
        },
        {
          cookieAuth: []
        }
      ],
      servers: [
        {
          url: server,
          description: '현재 서버'
        }
      ]
    },
    apis: ['./src/**/*.js']
  });
}

module.exports = { loadApiDoc };
