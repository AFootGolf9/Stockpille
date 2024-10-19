package controller

import (
	"stockpille/entity"
	"stockpille/service"

	"github.com/gin-gonic/gin"
)

func Login(c *gin.Context) {
	var user entity.User
	c.BindJSON(&user)
	token := service.Login(user)
	if token != "error" {
		c.JSON(200, gin.H{
			"token": token,
		})
	} else {
		c.JSON(400, gin.H{
			"message": "Invalid user or password",
		})
	}
}
