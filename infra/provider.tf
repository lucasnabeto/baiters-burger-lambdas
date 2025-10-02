terraform {
  backend "s3" {
    bucket = "baiters-burger-infra"
    key    = "terraform/lambdas/state.tfstate"
    region = "us-east-1"
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}