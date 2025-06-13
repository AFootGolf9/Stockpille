package middleware

import (
	"stockpille/entity"
	"stockpille/repository"
	"stockpille/repository/entityRepository"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")

		if token == "" {
			c.JSON(401, gin.H{
				"error": "Unauthorized: No token provided",
			})
			c.Abort()
			return
		}

		// check token
		userId := repository.GetUserIdByToken(token)
		user := entity.User{Id: userId}
		err := entityRepository.SelectPK(&user)

		if err != nil {
			c.Set("auth", false)
			c.JSON(401, gin.H{
				"error": "Unauthorized",
			})
			c.Abort()
			return
		}

		c.Set("auth", true)
		c.Set("user", user)
	}
}
