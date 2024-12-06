package controller

import (
	"stockpille/entity"
	"stockpille/repository"
	"stockpille/repository/entityRepository"

	"github.com/gin-gonic/gin"
)

func ValidateToken(c *gin.Context) {
	token := c.GetHeader("Authorization")
	userid := repository.GetUserIdByToken(token)
	if userid == -1 {
		c.JSON(401, gin.H{
			"message": "Invalid token",
		})
		c.Abort()
		return
	}
	user := entity.User{Id: userid}
	entityRepository.SelectPK(&user)
	c.JSON(200, gin.H{
		"user": user,
	})
}
