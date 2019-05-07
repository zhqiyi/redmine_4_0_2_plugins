# This file is a part of Redmine Checklists (redmine_checklists) plugin,
# issue checklists management plugin for Redmine
#
# Copyright (C) 2011-2018 RedmineUP
# http://www.redmineup.com/
#
# redmine_checklists is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# redmine_checklists is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with redmine_checklists.  If not, see <http://www.gnu.org/licenses/>.

module Redmine
  module ApiTest
    # Base class for API tests
    class Base < ActionDispatch::IntegrationTest
      # Test that a request allows the three types of API authentication
      #
      # * HTTP Basic with username and password
      # * HTTP Basic with an api key for the username
      # * Key based with the key=X parameter
      #
      # @param [Symbol] http_method the HTTP method for request (:get, :post, :put, :delete)
      # @param [String] url the request url
      # @param [optional, Hash] parameters additional request parameters
      # @param [optional, Hash] options additional options
      # @option options [Symbol] :success_code Successful response code (:success)
      # @option options [Symbol] :failure_code Failure response code (:unauthorized)
      def self.should_allow_api_authentication(http_method, url, parameters={}, options={})
        should_allow_http_basic_auth_with_username_and_password(http_method, url, parameters, options)
        should_allow_http_basic_auth_with_key(http_method, url, parameters, options)
        should_allow_key_based_auth(http_method, url, parameters, options)
      end

      # Test that a request allows the username and password for HTTP BASIC
      #
      # @param [Symbol] http_method the HTTP method for request (:get, :post, :put, :delete)
      # @param [String] url the request url
      # @param [optional, Hash] parameters additional request parameters
      # @param [optional, Hash] options additional options
      # @option options [Symbol] :success_code Successful response code (:success)
      # @option options [Symbol] :failure_code Failure response code (:unauthorized)
      def self.should_allow_http_basic_auth_with_username_and_password(http_method, url, parameters={}, options={})
        success_code = options[:success_code] || :success
        failure_code = options[:failure_code] || :unauthorized

        context "should allow http basic auth using a username and password for #{http_method} #{url}" do
          context "with a valid HTTP authentication" do
            setup do
              @user = User.generate! do |user|
                user.admin = true
                user.password = 'my_password'
              end
              send(http_method, url, parameters, credentials(@user.login, 'my_password'))
            end

            should_respond_with success_code
            should_respond_with_content_type_based_on_url(url)
            should "login as the user" do
              assert_equal @user, User.current
            end
          end

          context "with an invalid HTTP authentication" do
            setup do
              @user = User.generate!
              send(http_method, url, parameters, credentials(@user.login, 'wrong_password'))
            end

            should_respond_with failure_code
            should_respond_with_content_type_based_on_url(url)
            should "not login as the user" do
              assert_equal User.anonymous, User.current
            end
          end

          context "without credentials" do
            setup do
              send(http_method, url, parameters)
            end

            should_respond_with failure_code
            should_respond_with_content_type_based_on_url(url)
            should "include_www_authenticate_header" do
              assert @controller.response.headers.has_key?('WWW-Authenticate')
            end
          end
        end
      end

      # Test that a request allows the API key with HTTP BASIC
      #
      # @param [Symbol] http_method the HTTP method for request (:get, :post, :put, :delete)
      # @param [String] url the request url
      # @param [optional, Hash] parameters additional request parameters
      # @param [optional, Hash] options additional options
      # @option options [Symbol] :success_code Successful response code (:success)
      # @option options [Symbol] :failure_code Failure response code (:unauthorized)
      def self.should_allow_http_basic_auth_with_key(http_method, url, parameters={}, options={})
        success_code = options[:success_code] || :success
        failure_code = options[:failure_code] || :unauthorized

        context "should allow http basic auth with a key for #{http_method} #{url}" do
          context "with a valid HTTP authentication using the API token" do
            setup do
              @user = User.generate! do |user|
                user.admin = true
              end
              @token = Token.create!(:user => @user, :action => 'api')
              send(http_method, url, parameters, credentials(@token.value, 'X'))
            end
            should_respond_with success_code
            should_respond_with_content_type_based_on_url(url)
            should_be_a_valid_response_string_based_on_url(url)
            should "login as the user" do
              assert_equal @user, User.current
            end
          end

          context "with an invalid HTTP authentication" do
            setup do
              @user = User.generate!
              @token = Token.create!(:user => @user, :action => 'feeds')
              send(http_method, url, parameters, credentials(@token.value, 'X'))
            end
            should_respond_with failure_code
            should_respond_with_content_type_based_on_url(url)
            should "not login as the user" do
              assert_equal User.anonymous, User.current
            end
          end
        end
      end

      # Test that a request allows full key authentication
      #
      # @param [Symbol] http_method the HTTP method for request (:get, :post, :put, :delete)
      # @param [String] url the request url, without the key=ZXY parameter
      # @param [optional, Hash] parameters additional request parameters
      # @param [optional, Hash] options additional options
      # @option options [Symbol] :success_code Successful response code (:success)
      # @option options [Symbol] :failure_code Failure response code (:unauthorized)
      def self.should_allow_key_based_auth(http_method, url, parameters={}, options={})
        success_code = options[:success_code] || :success
        failure_code = options[:failure_code] || :unauthorized

        context "should allow key based auth using key=X for #{http_method} #{url}" do
          context "with a valid api token" do
            setup do
              @user = User.generate! do |user|
                user.admin = true
              end
              @token = Token.create!(:user => @user, :action => 'api')
              # Simple url parse to add on ?key= or &key=
              request_url = if url.match(/\?/)
                              url + "&key=#{@token.value}"
                            else
                              url + "?key=#{@token.value}"
                            end
              send(http_method, request_url, parameters)
            end
            should_respond_with success_code
            should_respond_with_content_type_based_on_url(url)
            should_be_a_valid_response_string_based_on_url(url)
            should "login as the user" do
              assert_equal @user, User.current
            end
          end

          context "with an invalid api token" do
            setup do
              @user = User.generate! do |user|
                user.admin = true
              end
              @token = Token.create!(:user => @user, :action => 'feeds')
              # Simple url parse to add on ?key= or &key=
              request_url = if url.match(/\?/)
                              url + "&key=#{@token.value}"
                            else
                              url + "?key=#{@token.value}"
                            end
              send(http_method, request_url, parameters)
            end
            should_respond_with failure_code
            should_respond_with_content_type_based_on_url(url)
            should "not login as the user" do
              assert_equal User.anonymous, User.current
            end
          end
        end

        context "should allow key based auth using X-Redmine-API-Key header for #{http_method} #{url}" do
          setup do
            @user = User.generate! do |user|
              user.admin = true
            end
            @token = Token.create!(:user => @user, :action => 'api')
            send(http_method, url, parameters, {'X-Redmine-API-Key' => @token.value.to_s})
          end
          should_respond_with success_code
          should_respond_with_content_type_based_on_url(url)
          should_be_a_valid_response_string_based_on_url(url)
          should "login as the user" do
            assert_equal @user, User.current
          end
        end
      end

      # Uses should_respond_with_content_type based on what's in the url:
      #
      # '/project/issues.xml' => should_respond_with_content_type :xml
      # '/project/issues.json' => should_respond_with_content_type :json
      #
      # @param [String] url Request
      def self.should_respond_with_content_type_based_on_url(url)
        case
        when url.match(/xml/i)
          should "respond with XML" do
            assert_equal 'application/xml', @response.content_type
          end
        when url.match(/json/i)
          should "respond with JSON" do
            assert_equal 'application/json', @response.content_type
          end
        else
          raise "Unknown content type for should_respond_with_content_type_based_on_url: #{url}"
        end
      end

      # Uses the url to assert which format the response should be in
      #
      # '/project/issues.xml' => should_be_a_valid_xml_string
      # '/project/issues.json' => should_be_a_valid_json_string
      #
      # @param [String] url Request
      def self.should_be_a_valid_response_string_based_on_url(url)
        case
        when url.match(/xml/i)
          should_be_a_valid_xml_string
        when url.match(/json/i)
          should_be_a_valid_json_string
        else
          raise "Unknown content type for should_be_a_valid_response_based_on_url: #{url}"
        end
      end

      # Checks that the response is a valid JSON string
      def self.should_be_a_valid_json_string
        should "be a valid JSON string (or empty)" do
          assert(response.body.blank? || ActiveSupport::JSON.decode(response.body))
        end
      end

      # Checks that the response is a valid XML string
      def self.should_be_a_valid_xml_string
        should "be a valid XML string" do
          assert REXML::Document.new(response.body)
        end
      end

      def self.should_respond_with(status)
        should "respond with #{status}" do
          assert_response status
        end
      end
    end
  end
end
