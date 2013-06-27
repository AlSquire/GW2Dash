
require 'rack'
require 'rack/static'

run Rack::Directory.new(".")
