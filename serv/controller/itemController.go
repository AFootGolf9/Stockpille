package controller

import (
	"fmt"
	"net/http"
	"stockpille/service"

	"github.com/gin-gonic/gin"
)

func CountItensController(c *gin.Context) {
	// Get the item ID from the request parameters
	itemId := c.Param("itemId")
	if itemId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Item ID is required"})
		return
	}
	// Convert itemId to an integer
	// Assuming itemId is a string that can be converted to an integer
	var itemIDInt int
	if _, err := fmt.Sscanf(itemId, "%d", &itemIDInt); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Item ID format"})
		return
	}
	// Call the service to count items
	count, err := service.CountItens(itemIDInt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count items"})
		return
	}

	// Return the count as a JSON response
	c.JSON(http.StatusOK, gin.H{"count": count})
}
