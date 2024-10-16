package controlller

import (
	"stockpille/entity"
	"stockpille/service"

	"github.com/gin-gonic/gin"
)

func NewItem(c *gin.Context) {
	var item entity.Item
	c.BindJSON(&item)
	service.NewItem(item)
	c.JSON(200, gin.H{
		"status": "Item created, lad",
	})
}

func GetAllItems(c *gin.Context) {
	c.JSON(200, gin.H{
		"items": service.GetAllItems(),
	})
}
