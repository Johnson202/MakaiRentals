using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Sabio.Models;
using Sabio.Models.Domain;
using Sabio.Models.Enums;
using Sabio.Models.Requests.Users;
using Sabio.Services;
using Sabio.Services.Interfaces;
using Sabio.Web.Controllers;
using Sabio.Web.Models.Responses;
using System;
using System.Threading.Tasks;

namespace Sabio.Web.Api.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UserApiController : BaseApiController
    {
        private IUserService _service = null;
        private IAuthenticationService<int> _authService = null;
        private IEmailService _emailService = null;

        public UserApiController(IUserService service, IAuthenticationService<int> authService, IEmailService emailService,
            ILogger<UserApiController> logger) : base(logger)
        {
            _service = service;
            _authService = authService;
            _emailService = emailService;
        }

        [HttpGet("{id:int}")]
        public ActionResult<ItemResponse<User>> GetById(int id)
        {
            int iCode = 200;
            BaseResponse response = null;

            try
            {
                User user = _service.GetById(id);

                if (user == null)
                {

                    iCode = 404;
                    response = new ErrorResponse($"Specified UserId was not found.");

                }
                else
                {

                    response = new ItemResponse<User>() { Item = user };

                }

            }
            catch (Exception ex)
            {

                iCode = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());

            }

            return StatusCode(iCode, response);
        }

        [HttpGet("")]
        public ActionResult<ItemResponse<Paged<User>>> GetAll(int pageIndex, int pageSize)
        {
            int iCode = 200;
            BaseResponse response = null;

            try
            {
                Paged<User> page = _service.GetAll(pageIndex, pageSize);

                if (page == null)
                {
                    iCode = 404;
                    response = new ErrorResponse("Users data could not be found");
                }
                else
                {
                    response = new ItemResponse<Paged<User>>() { Item = page };
                }
            }
            catch (Exception ex)
            {
                iCode = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());
            }

            return StatusCode(iCode, response);
        }

        [HttpGet("admin")]
        public ActionResult<ItemResponse<Paged<User>>> GetAllByUserName(int pageIndex, int pageSize, string query)
        {
            int iCode = 200;
            BaseResponse response = null;

            try
            {
                Paged<User> page = _service.GetAllByUserName(pageIndex, pageSize, query);

                if (page == null)
                {
                    iCode = 404;
                    response = new ErrorResponse("Users' data could not be found");
                }
                else
                {
                    response = new ItemResponse<Paged<User>>() { Item = page };
                }
            }
            catch (Exception ex)
            {
                iCode = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());
            }

            return StatusCode(iCode, response);
        }

        [HttpGet("current")]
        public ActionResult<ItemResponse<IUserAuthData>> GetCurrrent()
        {
            IUserAuthData user = _authService.GetCurrentUser();
            ItemResponse<IUserAuthData> response = new ItemResponse<IUserAuthData>();
            response.Item = user;

            return Ok200(response);
        }

        [HttpPost]
        [AllowAnonymous]
        public ActionResult<ItemResponse<int>> Create(UserAddRequest model)
        {
            ObjectResult result = null;

            string token = Guid.NewGuid().ToString();
            int tokenType = (int)TokenType.NewUser;

            try
            {
                int id = _service.Add(model);

                _service.AddToken(token, id, tokenType);

                _emailService.SendEmailConfirm(model, token);

                ItemResponse<int> response = new ItemResponse<int> { Item = id };

                result = Created201(response);
            }
            catch (Exception ex)
            {
                ErrorResponse response = new ErrorResponse(ex.Message);
                Logger.LogError(ex.ToString());

                result = StatusCode(500, response);
            }

            return result;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<SuccessResponse>> LogIn(UserLoginRequest model)
        {
            int iCode = 200;
            BaseResponse response = null;

            try
            {
                bool isValid = await _service.LogInAsync(model.Email, model.Password);

                if (isValid == false)
                {
                    iCode = 401;
                    response = new ErrorResponse("User data could not be validated");
                }
                else
                {
                    response = new SuccessResponse();
                }
            }
            catch (Exception ex)
            {
                iCode = 500;
                response = new ErrorResponse(ex.Message);
            }

            return StatusCode(iCode, response);
        }

        [HttpPost("logout")]
        public ActionResult<SuccessResponse> LogOut()
        {
            int iCode = 200;
            BaseResponse response = null;

            try
            {
                _authService.LogOutAsync();
                response = new SuccessResponse();
            }
            catch (Exception ex)
            {
                iCode = 500;
                response = new ErrorResponse(ex.Message);
            }

            return StatusCode(iCode, response);
        }

        [HttpPut("{id:int}")]
        public ActionResult<SuccessResponse> Update(UserUpdateRequest model)
        {
            int iCode = 200;
            BaseResponse response = null;

            try
            {
                _service.Update(model);

                response = new SuccessResponse();
            }
            catch (Exception ex)
            {
                iCode = 500;
                response = new ErrorResponse(ex.Message);
            }

            return StatusCode(iCode, response);
        }

        [HttpPut("{id:int}/status/{statusId:int}")]
        public ActionResult<SuccessResponse> UpdateStatus(int id, int statusId)
        {
            int iCode = 200;
            BaseResponse response = null;

            try
            {
                _service.UpdateStatus(id, statusId);

                response = new SuccessResponse();
            }
            catch (Exception ex)
            {
                iCode = 500;
                response = new ErrorResponse(ex.Message);
            }

            return StatusCode(iCode, response);

        }

        [HttpGet("search")]
        public ActionResult<ItemResponse<Paged<User>>> SearchPaginated(int pageIndex, int pageSize, string query)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                Paged<User> paged = _service.SearchPaginated(pageIndex, pageSize, query);

                if (paged == null)
                {
                    code = 404;
                    response = new ErrorResponse("Records Not Found");
                }
                else
                {
                    response = new ItemResponse<Paged<User>> { Item = paged };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());

            }
            return StatusCode(code, response);
        }

        [HttpPut("confirm")]
        [AllowAnonymous]
        public ActionResult<SuccessResponse> ConfirmEmail(string email, string token)
        {
            int iCode = 200;
            BaseResponse response = null;

            try
            {
                _service.UpdateConfirmed(email, token);
                response = new SuccessResponse();
            }
            catch (Exception ex)
            {
                iCode = 500;
                response = new ErrorResponse(ex.Message);
            }

            return StatusCode(iCode, response);
        }

        [HttpPut("forgot")]
        [AllowAnonymous]
        public ActionResult<SuccessResponse> ForgotPassword(string email)
        {
            int iCode = 200;
            BaseResponse response = null;

            string token = Guid.NewGuid().ToString();
            int tokenType = (int)TokenType.ResetPassword;

            try
            {
                _service.AddResetToken(email, token, tokenType);

                _emailService.SendResetPassword(email, token); 

                response = new SuccessResponse();
            }
            catch(Exception ex)
            {
                iCode = 500;
                response = new ErrorResponse(ex.Message);
            }

            return StatusCode(iCode, response);
        }

        [HttpPut("changepassword")]
        [AllowAnonymous]
        public ActionResult<SuccessResponse> ChangePassword(ChangePassword model)
        {
            int iCode = 200;
            BaseResponse response = null;

            try
            {
                _service.ChangePassword(model);
                response = new SuccessResponse();
            }
            catch (Exception ex)
            {
                iCode = 500;
                response = new ErrorResponse(ex.Message);
            }

            return StatusCode(iCode, response);
        }

    }

}
