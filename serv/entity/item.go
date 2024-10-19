package entity

type Item struct {
	Sku         int    `json:"sku"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

func (i *Item) GetId() int {
	return i.Sku
}

func (i *Item) SetId(id int) {
	i.Sku = id
}

func (i *Item) GetCamps() []string {
	return []string{"item", "sku", "name", "description"}
}

func (i *Item) GetData() []any {
	return []any{&i.Sku, &i.Name, &i.Description}
}

func (i *Item) GetPath() string {
	return "item"
}

func (i *Item) Validate() {
	if i.Name == "" {
		panic("Name is required")
	}
}

func (i *Item) ValidateUpdate() {
}

func (i *Item) New() Entity {
	return &Item{}
}
