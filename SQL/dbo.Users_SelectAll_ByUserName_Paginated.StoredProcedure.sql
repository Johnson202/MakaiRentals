USE [Makai]
GO
/****** Object:  StoredProcedure [dbo].[Users_SelectAll_ByUserName_Paginated]    Script Date: 3/31/2023 10:41:40 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author: Johnson, Jonathon
-- Create date: 22MAR23
-- Description: Select All (paginated) by user's first name and/or last name from [dbo].[Users] (Admin Only), when query is nullable, behaves as generic paginated Select All
-- Code Reviewer:

-- MODIFIED BY: Johnson, Jonathon
-- MODIFIED DATE: 30MAR23
-- Code Reviewer:
-- Note: have to match what is selected by Users_SelectAll_Paginated for front-end purposes
-- =============================================

--CREATE PROC [dbo].[Users_SelectAll_ByUserName_Paginated]

CREATE PROC [dbo].[Users_SelectAll_ByUserName_Paginated]
							@PageIndex int
						   ,@PageSize int
						   ,@Query nvarchar(100) = NULL

AS

/*TEST CODE

DECLARE @PageIndex int = 0
       ,@PageSize int = 10
	   ,@Query nvarchar(100) = 'Bob';

EXECUTE [dbo].[Users_SelectAll_ByUserName_Paginated]
							@PageIndex
						   ,@PageSize
						   ,@Query;
*/

BEGIN

	DECLARE @offset int = @PageIndex * @PageSize

	SELECT u.[Id]
	      ,u.[Email]
		  ,u.[Phone]
		  ,u.[FirstName]
		  ,u.[LastName]
		  ,u.[Mi]
		  ,u.[AvatarUrl]
		  ,u.[DOB]
		  ,Roles = (SELECT r.[Id]
						  ,r.[Name]
					FROM [dbo].[Roles] AS r 
					JOIN [dbo].[UserRoles] AS ur
					ON r.[Id] = ur.[RoleId] 
					WHERE u.[Id] = ur.[UserId]
					FOR	JSON AUTO)
			,st.[Id] 
			,st.[Name]
		  ,TotalCount = COUNT(1) OVER()
	FROM [dbo].[Users] AS u 
	JOIN [dbo].[StatusTypes] as st
	ON u.[StatusId] = st.[Id]
	WHERE (u.[FirstName] LIKE '%' + @Query + '%') OR (u.[LastName] LIKE '%' + @Query + '%')
	ORDER BY u.[LastName] ASC, u.[FirstName] ASC

	OFFSET @offSet ROWS
	FETCH NEXT @PageSize ROWS ONLY;

END
GO
