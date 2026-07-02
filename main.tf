terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.79"
    }
  }
}
provider "azurerm" {
  features {}
  resource_provider_registrations = "none"
}

data "azurerm_resource_group" "sandbox" {
  name = "1-a8b7ff6c-playground-sandbox"
}


resource "azurerm_service_plan" "app_plan" {
  name                = "1-a8b7ff6c-playground-sandbox"
  location            = data.azurerm_resource_group.sandbox.location
  resource_group_name = data.azurerm_resource_group.sandbox.name

  os_type             = "Linux" 
  sku_name            = "S1"     
}

resource "azurerm_linux_web_app" "caromero0113" {
  name                = "caromero13"
  location            = data.azurerm_resource_group.sandbox.location
  resource_group_name = data.azurerm_resource_group.sandbox.name
  service_plan_id     = azurerm_service_plan.app_plan.id

  site_config {
       application_stack {
        dotnet_version = "8.0"
    }
   
  }

  app_settings = {
    "SOME_KEY" = "some-value"
  }

}