package controller

import (
	"stockpille/repository"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetItemQuantity(c *gin.Context) {
	num, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		print(err.Error())
		c.JSON(400, gin.H{
			"error": "Invalid ID",
		})
		return
	}
	out := repository.GetItemQuantity(num)
	c.JSON(200, gin.H{
		"quantity": out,
	})
}
