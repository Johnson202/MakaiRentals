USE [Makai]
GO
/****** Object:  StoredProcedure [dbo].[Advertisements_Update]    Script Date: 3/27/2023 2:15:57 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
/*
 Author: Amador Torres
 Create date: 22March23
 Description: Insert into dbo.Advertisements
 Code Reviewer: Osein Solkin
*/
-- =============================================
CREATE Proc [dbo].[Advertisements_Update]

		@ProductId int
		,@OwnerId int
		,@Title nvarchar(100) 
		,@AdMainImage nvarchar(255)= Null
		,@Details nvarchar(100)= Null
		,@DateStart datetime2(7) 
		,@DateEnd datetime2(7)
		,@Id int 

as
----------------Test Code-----------
/*
Declare		
		 @Id int= 4
		,@ProductId int =14
		,@OwnerId int= 16
		,@Title nvarchar(100) = 'Ad'
		,@AdMainImage nvarchar(255)='https://ca.slack-edge.com/T08EKJ58F-U04CXPUJPMJ-79d6b66fb3ec-512'
		,@Details nvarchar(100)='image of me'
		,@DateStart datetime2(7) = getutcdate()
		,@DateEnd datetime2(7)= getutcdate()
Select * 
From dbo.Advertisements
Where Id = @Id

Execute dbo.Advertisements_Update
   @ProductId
   ,@OwnerId
   ,@Title
   ,@AdMainImage
   ,@Details
   ,@DateStart
   ,@DateEnd
  ,@Id
  
Select * 
From dbo.Advertisements
Where Id = @Id

*/
Begin
Declare @DateModified datetime2(7) = getutcdate();
UPDATE [dbo].[Advertisements]
          Set [ProductId]= @ProductId
           ,[OwnerId] =@OwnerId
		   ,[Title]= @Title
           ,[AdMainImage]= @AdMainImage
           ,[Details]= @Details
           ,[DateStart]= @DateStart
           ,[DateEnd]= @DateEnd

		   Where Id = @Id

End
GO
