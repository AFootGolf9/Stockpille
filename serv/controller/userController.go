package controller

import (
	"stockpille/entity"
	"stockpille/service"
	"strings"

	"github.com/gin-gonic/gin"
)

func Login(c *gin.Context) {
	var user entity.User
	c.BindJSON(&user)
	user.Name = strings.ToUpper(user.Name)
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
