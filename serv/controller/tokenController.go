package controller

import (
	"stockpille/repository"

	"github.com/gin-gonic/gin"
)

func ValidateToken(c *gin.Context) {
	token := c.GetHeader("Authorization")
	if repository.GetUserIdByToken(token) == -1 {
		c.JSON(401, gin.H{
			"message": "Invalid token",
		})
		c.Abort()
	}

}
