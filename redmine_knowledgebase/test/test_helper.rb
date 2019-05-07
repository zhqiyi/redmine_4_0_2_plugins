$VERBOSE = nil

# Load the normal Rails helper
require File.expand_path(File.dirname(__FILE__) + '/../../../test/test_helper')

ActiveRecord::FixtureSet.create_fixtures(File.dirname(__FILE__) + '/fixtures/', %i[enabled_modules kb_articles kb_categories])
